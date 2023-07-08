FROM public.ecr.aws/lambda/nodejs:18

RUN yum update -y && yum groupinstall -y 'Development Tools'

WORKDIR ${LAMBDA_TASK_ROOT}
COPY dashboard/prisma/schema.prisma ./prisma/schema.prisma
COPY lambda/challenge/package.json lambda/challenge/package-lock.json lambda/challenge/lambda.ts lambda/challenge/tsconfig.json ./
RUN npm install && npm run prisma:generate && npm run build

CMD ["lambda.handler"]
