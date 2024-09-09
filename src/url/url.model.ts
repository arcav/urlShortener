import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class Url extends Model<Url> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  originalUrl: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  shortUrl: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  clickCount: number;
}
