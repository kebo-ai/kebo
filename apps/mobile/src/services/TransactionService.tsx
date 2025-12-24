import { supabase } from "../config/supabase";
import { TransactionSnapshotIn } from "../models/transaction/transaction";
import moment from "moment";
import logger from "../utils/logger";

export class TransactionService {
  static async createTransaction(transaction: TransactionSnapshotIn) {
    try {
      const sanitizedData = JSON.parse(JSON.stringify(transaction)) as any;
      if (sanitizedData.recurrence_end_date === "") {
        delete sanitizedData.recurrence_end_date;
      }

      const dataToInsert = {
        ...sanitizedData,
        from_account_id: sanitizedData.from_account_id || null,
        to_account_id: sanitizedData.to_account_id || null,
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating transaction:", error);
      throw error;
    }
  }

  static async getTransactionsByMonth(
    page = 1,
    limit = 10,
    filters?: {
      accountIds?: string[];
      categoryIds?: string[];
      transactionType?: "Income" | "Expense";
      months?: string[];
    }
  ) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("transactions_with_details")
        .select("*")
        .eq("is_deleted", false)
        .order("date", { ascending: false });

      if (filters) {
        logger.debug("Applying filters to API:", JSON.stringify(filters));

        if (filters.accountIds && filters.accountIds.length > 0) {
          query = query.in("account_id", filters.accountIds);
          logger.debug("Filter by accounts:", filters.accountIds);
        }

        if (filters.categoryIds && filters.categoryIds.length > 0) {
          query = query.in("category_id", filters.categoryIds);
          logger.debug("Filter by categories:", filters.categoryIds);
        }

        if (filters.transactionType) {
          query = query.eq("transaction_type", filters.transactionType);
          logger.debug("Filter by transaction type:", filters.transactionType);
        }

        if (filters.months && filters.months.length > 0) {
          logger.debug("Processing month filters:", filters.months);

          let allResults: any[] = [];

          for (const month of filters.months) {
            try {
              const startDate = moment(month)
                .startOf("month")
                .format("YYYY-MM-DD");
              const endDate = moment(month).endOf("month").format("YYYY-MM-DD");

              logger.debug(
                `Querying month ${month}: from ${startDate} to ${endDate}`
              );

              let monthQuery = supabase
                .from("transactions_with_details")
                .select("*")
                .eq("is_deleted", false)
                .gte("date", startDate)
                .lte("date", endDate);

              if (filters.accountIds && filters.accountIds.length > 0) {
                monthQuery = monthQuery.in("account_id", filters.accountIds);
              }

              if (filters.categoryIds && filters.categoryIds.length > 0) {
                monthQuery = monthQuery.in("category_id", filters.categoryIds);
              }

              if (filters.transactionType) {
                monthQuery = monthQuery.eq(
                  "transaction_type",
                  filters.transactionType
                );
              }

              const { data, error } = await monthQuery;

              if (error) {
                logger.error(`Error querying month ${month}:`, error);
                throw error;
              }

              if (data && data.length > 0) {
                logger.debug(
                  `Found ${data.length} transactions for month ${month}`
                );
                allResults = [...allResults, ...data];
              } else {
                logger.debug(`No transactions found for month ${month}`);
              }
            } catch (error) {
              logger.error(`Error processing month ${month}:`, error);
            }
          }

          allResults.sort(
            (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
          );

          const paginatedResults = allResults.slice(from, to + 1);
          logger.debug(
            `Found ${allResults.length} total results, returning ${paginatedResults.length} for page ${page}`
          );

          const groupedTransactions =
            this.groupTransactionsByMonth(paginatedResults);
          return groupedTransactions;
        }
      }

      logger.debug(`Executing query with pagination: ${from}-${to}`);
      const { data, error } = await query.range(from, to);

      if (error) throw error;

      const groupedTransactions = this.groupTransactionsByMonth(data);
      return groupedTransactions;
    } catch (error) {
      logger.error("Error fetching transactions by month:", error);
      throw error;
    }
  }

  static groupTransactionsByMonth(data: any[]) {
    const sortedData = [...data].sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf()
    );

    return sortedData.reduce((acc: any[], transaction: any) => {
      const date = moment(transaction.date);
      const month = date.format("MMMM");
      const year = date.format("YYYY");
      const monthYear = `${
        month.charAt(0).toUpperCase() + month.slice(1)
      } ${year}`;

      const existingMonth = acc.find((group) => group.name === monthYear);

      if (existingMonth) {
        existingMonth.transactions.push({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          transaction_type: transaction.transaction_type,
          category_id: transaction.category_id,
          category_icon_url: transaction.category_icon_url,
          account_id: transaction.account_id,
          bank_url: transaction.bank_url,
          category_name: transaction.category_name,
          account_name: transaction.account_name,
          from_account_id: transaction.from_account_id,
          from_account_name: transaction.from_account_name,
          from_account_url: transaction.from_account_url,
          to_account_id: transaction.to_account_id,
          to_account_name: transaction.to_account_name,
          to_account_url: transaction.to_account_url,
          is_recurring: transaction.is_recurring,
          recurrence_cadence: transaction.recurrence_cadence,
          recurrence_end_date: transaction.recurrence_end_date,
          metadata: transaction.metadata,
        });
      } else {
        acc.push({
          name: monthYear,
          date: transaction.date,
          transactions: [
            {
              id: transaction.id,
              description: transaction.description,
              amount: transaction.amount,
              date: transaction.date,
              transaction_type: transaction.transaction_type,
              category_id: transaction.category_id,
              category_icon_url: transaction.category_icon_url,
              account_id: transaction.account_id,
              bank_url: transaction.bank_url,
              category_name: transaction.category_name,
              account_name: transaction.account_name,
              from_account_id: transaction.from_account_id,
              from_account_name: transaction.from_account_name,
              from_account_url: transaction.from_account_url,
              to_account_id: transaction.to_account_id,
              to_account_name: transaction.to_account_name,
              to_account_url: transaction.to_account_url,
              is_recurring: transaction.is_recurring,
              recurrence_cadence: transaction.recurrence_cadence,
              recurrence_end_date: transaction.recurrence_end_date,
              metadata: transaction.metadata,
            },
          ],
        });
      }

      return acc;
    }, []);
  }

  static async getTransactions(page = 1, limit = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from("transactions_with_details")
        .select("*")
        .range(from, to);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error fetching transactions:", error);
      throw error;
    }
  }

  static async updateTransaction(
    id: string,
    transaction: Partial<TransactionSnapshotIn>
  ) {
    try {
      const sanitizedData = JSON.parse(JSON.stringify(transaction)) as any;

      if (sanitizedData.recurrence_end_date === "") {
        delete sanitizedData.recurrence_end_date;
      }

      const fieldsToClean = ['category_id', 'account_id', 'from_account_id', 'to_account_id'];
      fieldsToClean.forEach(field => {
        if (sanitizedData[field] === "" || sanitizedData[field] === undefined) {
          sanitizedData[field] = null;
        }
      });

      logger.debug("Final data to update:", sanitizedData);

      const { data, error } = await supabase
        .from("transactions")
        .update(sanitizedData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error updating transaction:", error);
      throw error;
    }
  }

  static async deleteTransaction(id: string) {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);

      logger.info("Transaction deleted:", id);
      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting transaction:", error);
      throw error;
    }
  }

  static async getRecurringTransactions() {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("is_recurring", true)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error fetching recurring transactions:", error);
      throw error;
    }
  }

  static async createTransferTransaction(transferData: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    currency: string;
    description: string;
    category_id: string;
    is_recurring: boolean;
    date: string;
    metadata: any;
  }) {
    try {
      const apiData = {
        p_from_account_id: transferData.from_account_id,
        p_to_account_id: transferData.to_account_id,
        p_amount: transferData.amount,
        p_currency: transferData.currency,
        p_description: transferData.description,
        p_date: transferData.date,
        p_is_recurring: transferData.is_recurring,
        p_metadata: transferData.metadata || {},
      };

      logger.debug("Sending transfer transaction data to API:", apiData);

      const { data, error } = await supabase
        .rpc("create_transfer_transaction", apiData)
        .select();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error("Error creating transfer transaction:", error);
      throw error;
    }
  }

  static async getUserBalance() {
    try {
      const { data, error } = await supabase
        .from("user_balance")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error fetching user balance:", error);
      throw error;
    }
  }
}
