import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Job } from "./Job";

export enum UserRole {
  ADMIN = "admin",
  EMPLOYER = "employer",
  JOBSEEKER = "jobseeker",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true, unique: true })
  linkedInId?: string; 

  @Column({ length: 1000, nullable: true })
  linkedInAccessToken?: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.EMPLOYER,
  })
  role!: UserRole;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @OneToMany(() => Job, (job) => job.user)
  jobs!: Job[];

  constructor(partial: Partial<User> = {}) {
    Object.assign(this, partial);
  }
}
