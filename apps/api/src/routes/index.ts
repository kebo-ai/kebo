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
  app.route("/transactions", transactionsRoutes)
  app.route("/categories", categoriesRoutes)
  app.route("/accounts", accountsRoutes)
  app.route("/banks", banksRoutes)
  app.route("/budgets", budgetsRoutes)
  app.route("/reports", reportsRoutes)
  app.route("/users", usersRoutes)
  app.route("/reference", referenceRoutes)
  app.route("/reviews", reviewsRoutes)
  app.route("/ai", aiRoutes)
  app.route("/admin", adminRoutes)
}
