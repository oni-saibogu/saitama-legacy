import type { FastifyRequest } from "fastify";

export const getURLFromRequest = (request: FastifyRequest) =>
  new URL(
    format("%://%%", request.protocol, request.hostname, request.originalUrl)
  );

export const checkedConcatQueryString = (url: URL, query: URLSearchParams) => {
  const href = url.href;
  return format(
    "%%%",
    url,
    href.startsWith("?") ? null : "?",
    query.toString()
  );
};

export const format = <
  T extends Array<string | number | object | null | undefined>
>(
  delimiter: string,
  ...values: T
) => {
  return String(
    values.reduce(
      (result, value) =>
        String(result).replace(/(%|%d|%s)/, value ? value.toString() : ""),
      delimiter
    )
  );
};
