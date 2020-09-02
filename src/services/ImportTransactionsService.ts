import fs from 'fs';

import parse from 'csv-parse';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

interface CsvRow {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: fs.PathLike): Promise<Transaction[]> {
    const balance = await TransactionsRepository.getBalance();

    const output = await new Promise<CsvRow[]>(resolve => {
      const csvColumns: string[] = [];
      const csvRows: CsvRow[] = [];
      fs.createReadStream(path)
        .pipe(parse({ delimiter: ',' }))
        .on('data', csvRow => {
          if (csvColumns.length === 0) return csvColumns.push(csvRow);

          const [title, type, value, category] = csvRow;

          if (!title)
            throw new AppError(
              `Transactions param title ${title} is not valid`,
            );
          if (!value || value < 0)
            throw new AppError(
              `Transactions param value ${value} is not valid`,
            );
          if (!type || ['income', 'outcome'].indexOf(type.trim()) < 0)
            throw new AppError(`Transactions param type ${type} is not valid`);
          if (!category)
            throw new AppError(`This category ${category} is not valid`);

          balance[type.trim() as 'income' | 'outcome'] = Number(value.trim);
          if (type === 'outcome' && balance.total < value)
            throw new AppError(
              `This transactions outcome without valid balance`,
            );

          const row: CsvRow = {
            title: title.trim(),
            type: type.trim(),
            value: value.trim(),
            category: category.trim(),
          };

          return csvRows.push(row);
        })
        .on('end', () => {
          resolve(csvRows);
        });
    });

    const transactions = output.map(
      ({ type, title, value, category }: CsvRow) => {
        return CreateTransactionService.execute({
          type,
          title,
          value,
          category,
        });
      },
    );

    return Promise.all(transactions);
  }
}

export default new ImportTransactionsService();
