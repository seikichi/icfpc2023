FROM public.ecr.aws/lambda/nodejs:18

RUN yum update -y && yum groupinstall -y 'Development Tools'

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable
ENV PATH $PATH:/root/.cargo/bin
RUN rustup install stable

WORKDIR ${LAMBDA_TASK_ROOT}
COPY dashboard/prisma/schema.prisma ./prisma/schema.prisma
COPY lambda/solver/package.json lambda/solver/package-lock.json lambda/solver/lambda.ts lambda/solver/tsconfig.json ./
RUN npm install && npm run prisma:generate && npm run build

COPY solver/Cargo.lock solver/Cargo.toml ./
COPY solver/core/ core/
COPY solver/cli/ cli/
COPY solver/wasm/ wasm/
RUN cargo build --release

CMD ["lambda.handler"]
