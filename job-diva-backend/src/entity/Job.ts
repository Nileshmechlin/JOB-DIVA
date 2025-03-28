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
  id!: string;

  @Column()
  title!: string;

  @Column()
  companyName!: string;

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
  platforms!: string[];

  @CreateDateColumn()
  postedAt?: Date;

  @ManyToOne(() => User, (user) => user.jobs, {nullable:false})
  user!:User;
}
