# Stage 1: Build
FROM docker.io/golang:1.20.3-bullseye AS builder

WORKDIR /go/src/goauthentik.io

COPY go.mod .
COPY go.sum .
COPY gen-go-api .
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

ENV CGO_ENABLED=0
COPY . .
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -o /go/radius ./cmd/radius

# Stage 2: Run
FROM gcr.io/distroless/static-debian11:debug

LABEL org.opencontainers.image.url https://goauthentik.io
LABEL org.opencontainers.image.description goauthentik.io Radius outpost, see https://goauthentik.io for more info.
LABEL org.opencontainers.image.source https://github.com/goauthentik/authentik

ARG GIT_BUILD_HASH
ENV GIT_BUILD_HASH=$GIT_BUILD_HASH

COPY --from=builder /go/radius /

HEALTHCHECK --interval=5s --retries=20 --start-period=3s CMD [ "/radius", "healthcheck" ]

EXPOSE 1812/udp 9300

USER 1000

ENTRYPOINT ["/radius"]
