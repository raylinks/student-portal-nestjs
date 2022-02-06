import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type jwtPayload = {
    sub: string,
    email: string
}

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'at-secret',

        });
    }

    async validate(payload: jwtPayload) {
        return payload;

        // req.user = payload
    }
}