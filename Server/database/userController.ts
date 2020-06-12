import { RouterContext } from 'https://deno.land/x/oak/mod.ts';
import { users } from "./mongoConnect.ts";

export default {
    async index(ctx: any) {
        console.log('index(ctx): ', ctx );

        const data = await users.find({ name: 'Rost', pwd: 'Shevtsov'});

        return this.sendData( ctx, 201, data );
    },
    async userLogin(ctx: RouterContext) {
        try {
            const { value: {name, pwd} } = await ctx.request.body();

            if (!name || !pwd) {
                return this.sendError( ctx, 400, "Data does't response to server." );
            }

            const data = await users.findOne({ name: 'Allison' });

            return this.sendData( ctx, 201, data );
        }
        catch (e) {
            return this.sendError( ctx, 404, "User does't exists in our database." );
        }
    },
    async createUser(ctx: RouterContext) {
        try {
            // const { req, res} = ctx;
            // res.set('Access-Control-Allow-Origin', '*');
            // res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            // res.set('Access-Control-Allow-Headers', 'Content-Type');

            const { value: {name, pwd} } = await ctx.request.body();

            if (!name || !pwd) {
                return this.sendError( ctx, 400, "Data does't response to server." );
            }

            const person: any = {
                name,
                pwd,
                date: new Date(),
            };

            const id = await users.insertOne(person);  person._id = id;
            console.log('person._id, body: ', person._id, person );

            return this.sendData( ctx, 201, person );
        }
        catch (e) {
            return this.sendError( ctx, 400, "User does't exists in our database." );
        }
    },
    sendError(ctx: RouterContext, httpError: any, contextError: String) {
        ctx.response.status = 400;
        ctx.response.body = { error: contextError };
    },
    sendData(ctx: RouterContext, httpStatus: any, contextData: any) {
        ctx.response.status = httpStatus;
        ctx.response.body = contextData;
    },
    async validateLogin(ctx: any) {
        let errors = [];
        let status;
        const { value } = await ctx.request.body();
        if (!value) {
            ctx.response.status = 400; // bad request
            ctx.response.body = {
                errors: { message: "Please provide the required data" },
            };
            return;
        }

        const fields = ["email", "password"];
        for (let index = 0; index < fields.length; index++) {
            if (!value[fields[index]]) {
                status = 422; // unprocessable entity
                errors.push({ [fields[index]]: `${fields[index]} field is required` });
            }
        }

        if (status) {
            ctx.response.status = status;
            ctx.response.body = { errors };
            return false;
        }
        return value;
    },
}