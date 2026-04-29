FROM docker.io/oven/bun:latest

WORKDIR /app

# Copy ALL project files first
COPY . .

# Now install dependencies
RUN bun install --frozen-lockfile

# The "prisma generate" postinstall script should now find prisma/schema.prisma

CMD ["bun", "run", "start"]