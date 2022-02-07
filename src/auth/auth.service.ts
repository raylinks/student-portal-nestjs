import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from './types';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService, private config: ConfigService,) { }

    async signupLocal(dto: AuthDto): Promise<Tokens> {
        const hash = await this.hashData(dto.password);
        const newUser = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash,
            },
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials incorrect');
                }
            }
            throw error;
        });

        const tokens = await this.getTokens(newUser.id, newUser.email);
        await this.updateRtHash(newUser.id, tokens.refresh_token);
        return tokens;
    }

    async signinLocal(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) throw new ForbiddenException("Access Denied");

        const passwordMatches = await bcrypt.compare(dto.password, user.hash)
        if (!passwordMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: number) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: {
                    not: null
                }
            },
            data: {
                hashedRt: null
            }
        })
    }
    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user || !user.hashedRt) throw new ForbiddenException("Access Denied");

        const rtMatches = await bcrypt.compare(rt, user.hashedRt)
        if (!rtMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getTokens(user.id, user.email);
        await this.updateRtHash(user.id, tokens.refresh_token);
        return tokens;
    }


    async updateRtHash(userId: number, rt: string) {
        const hash = await this.hashData(rt);
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRt: hash,
            },
        })
    }

    hashData(data: string) {
        return bcrypt.hash(data, 10);
    }

    async getTokens(userId: number, email: string): Promise<Tokens> {
        const jwtPayload: JwtPayload = {
            sub: userId,
            email: email,
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(jwtPayload, {
                secret: this.config.get<string>('AT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(jwtPayload, {
                secret: this.config.get<string>('RT_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }

}
