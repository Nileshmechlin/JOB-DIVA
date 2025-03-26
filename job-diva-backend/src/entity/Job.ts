import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: number;

  @Column()
  title!: string;

  @Column()
  company!: string;

  @Column()
  location!: string;

  @Column()
  remote: boolean = false;

  @Column({ type: "enum", enum: ["Direct Hire", "Contract"] })
  employmentType!: string;

  @Column({
    type: "enum",
    enum: ["H1B", "Green Card", "US Citizen", "EAD"],
  })
  workAuth!: string;

  @Column()
  description!: string;

  @Column("simple-array")
  @CreateDateColumn()
  postedAt?: Date;

  @ManyToOne(() => User, (user) => user.jobs, {nullable:false})
  user!:User;
}
