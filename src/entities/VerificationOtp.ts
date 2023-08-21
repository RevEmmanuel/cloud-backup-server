import {Entity, PrimaryGeneratedColumn, Column, PrimaryColumn} from 'typeorm';

@Entity()
export class VerificationOtp {

    @PrimaryColumn()
    'otp': string;

    @Column({
        unique: true
    })
    'ownerEmail': string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    'expiresAt': Date;

}
