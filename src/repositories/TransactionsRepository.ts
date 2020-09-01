import { EntityRepository, Repository, createQueryBuilder } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionTotal {
  type: 'income' | 'outcome';
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions: TransactionTotal[] = await createQueryBuilder(
      'transactions',
    )
      .select(['type', 'sum(value) as total'])
      .groupBy('type')
      .getRawMany();

    const balance: Balance = { income: 0, outcome: 0, total: 0 };

    transactions.forEach(transaction => {
      balance[transaction.type] = transaction.total;
    });

    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default new TransactionsRepository();
