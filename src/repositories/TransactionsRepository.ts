import { EntityRepository, Repository, createQueryBuilder } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionTotal {
  type: string;
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
      if (transaction.type === 'income') balance.income = transaction.total;
      if (transaction.type === 'outcome') balance.outcome = transaction.total;
    });

    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default TransactionsRepository;
