import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransactionDTO): Promise<Transaction> {
    if (!title) throw new AppError(`Transactions param title is not valid`);
    if (!value || value < 0)
      throw new AppError(`Transactions param value is not valid`);
    if (!type || ['income', 'outcome'].indexOf(type) < 0)
      throw new AppError(`Transactions param type is not valid`);
    if (!category) throw new AppError(`This category ${category} is not valid`);

    const categoryExists = await Category.findOne({
      where: { title: category },
    });

    let category_id = categoryExists?.id;
    if (!categoryExists) {
      const categoryCreated = Category.create({ title: category });
      await categoryCreated.save();

      category_id = categoryCreated.id;
    }

    const transaction = Transaction.create({
      title,
      value,
      type,
      category_id,
    });
    return transaction.save();
  }
}

export default new CreateTransactionService();
