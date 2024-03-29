import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { StripeService } from '../services/stripe.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as hashUtil from '../utils/hash';
import * as lodash from 'lodash';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private stripeService: StripeService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userByEmail = await this.prismaService.user.findUnique({
      where: {
        email: createUserDto.email.toLocaleLowerCase(),
      },
    });

    if (userByEmail) {
      throw new BadRequestException('User with this email exists');
    }

    const userByNickName = await this.prismaService.user.findUnique({
      where: {
        nick: createUserDto.nick,
      },
    });

    if (userByNickName) {
      throw new BadRequestException('Nickname must be unique');
    }

    const customer = await this.stripeService.createCustomer(
      createUserDto.email,
    );

    const hash = await hashUtil.getHash(createUserDto.password);

    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hash,
        stripeAccountId: customer.id,
      },
    });

    return lodash.omit(user, ['password']);
  }

  async findOne(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not exists');
    }

    return lodash.omit(user, ['password']);
  }

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException('User not exists');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const userWithThisNickame = await this.prismaService.user.findUnique({
      where: {
        nick: updateUserDto.nick,
      },
    });

    if (userWithThisNickame) {
      throw new BadRequestException('User with this nickname exists');
    }

    return this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...updateUserDto,
      },
    });
  }
}
