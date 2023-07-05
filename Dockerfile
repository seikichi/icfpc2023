FROM public.ecr.aws/lambda/nodejs:18

RUN yum update -y && yum groupinstall -y 'Development Tools'

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable
ENV PATH $PATH:/root/.cargo/bin
RUN rustup install stable

WORKDIR ${LAMBDA_TASK_ROOT}
COPY dashboard/prisma/schema.prisma ./prisma/schema.prisma
COPY package.json package-lock.json lambda.ts tsconfig.json ./
RUN npm install && npm run prisma:generate && npm run build

COPY Cargo.lock Cargo.toml ./
COPY core/ core/
COPY cli/ cli/
RUN cargo build --release

CMD ["lambda.handler"]
