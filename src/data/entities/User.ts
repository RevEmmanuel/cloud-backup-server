import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEmail } from "class-validator"
import { Expose, Exclude } from 'class-transformer';

@Entity("users")
export class User {

    @PrimaryGeneratedColumn()
    @Expose()
    'id': number

    @Column({
        unique: true
    })
    @IsEmail()
    @Expose()
    'email': string;

    @Column()
    @Exclude()
    'password': string;

    @Column()
    @Expose()
    'fullName': string;

    @Column({ default: false })
    @Expose()
    'isVerified': boolean;

    @Column()
    @Exclude()
    'role': string;

    @Column({ default: false })
    @Exclude()
    'isDeleted': boolean;

    @Column({ default: false })
    @Exclude()
    'isDisabled': boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    'dateJoined': Date;

}
