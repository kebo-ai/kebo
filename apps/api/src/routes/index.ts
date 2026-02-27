import type { OpenAPIHono } from "@hono/zod-openapi"
import type { AppEnv } from "@/types/env"
import accountsRoutes from "./accounts.routes"
import adminRoutes from "./admin.routes"
import aiRoutes from "./ai.routes"
import banksRoutes from "./banks.routes"
import budgetsRoutes from "./budgets.routes"
import categoriesRoutes from "./categories.routes"
import referenceRoutes from "./reference.routes"
import reportsRoutes from "./reports.routes"
import reviewsRoutes from "./reviews.routes"
import transactionsRoutes from "./transactions.routes"
import usersRoutes from "./users.routes"

export function registerRoutes(app: OpenAPIHono<AppEnv>) {
  return app
    .route("/transactions", transactionsRoutes)
    .route("/categories", categoriesRoutes)
    .route("/accounts", accountsRoutes)
    .route("/banks", banksRoutes)
    .route("/budgets", budgetsRoutes)
    .route("/reports", reportsRoutes)
    .route("/users", usersRoutes)
    .route("/reference", referenceRoutes)
    .route("/reviews", reviewsRoutes)
    .route("/ai", aiRoutes)
    .route("/admin", adminRoutes)
}
