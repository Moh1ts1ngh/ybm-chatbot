import type { NextFunction, Request, Response } from "express";

/**
 * Resolves the tenant identifier from headers and attaches it to the request.
 * If `required` is true, the middleware will reject requests lacking the header.
 */
export function tenantContext(required = false) {
  return (req: Request, res: Response, next: NextFunction) => {
    const tenantHeader = req.header("x-tenant-id");
    if (tenantHeader) {
      req.tenantId = tenantHeader;
    }

    if (required && !req.tenantId) {
      return res.status(400).json({
        error: {
          message: "Missing tenant context. Provide 'x-tenant-id' header or a valid embed token.",
        },
      });
    }

    return next();
  };
}

