import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/index.js';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto } from './dto/create-admin-user.dto.js';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto.js';
import { UserRole } from '../entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    // We specifically select password and refreshToken here because they are select: false in the entity
    return this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        authProvider: true,
        isActive: true,
        refreshToken: true,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  /**
   * Updates the user's refresh token by hashing it first
   */
  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Removes the refresh token from the database (logout)
   */
  async removeRefreshToken(userId: string) {
    await this.usersRepository.update(userId, {
      refreshToken: '',
    });
  }

  /**
   * Get user if the provided refresh token matches the hashed one in the database
   */
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<User | null> {
    const user = await this.findByIdWithRefreshToken(userId);
    if (!user?.refreshToken) {
      return null;
    }

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refreshToken);

    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  private async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, refreshToken: true, email: true, name: true, role: true, isActive: true }, // Needed for JWT payload
    });
  }

  // ─── ADMIN METHODS ─────────────────────────────────────────────────────────

  async findForAdmin(
    page: number,
    limit: number,
    search?: string,
    role?: string,
    status?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role && role !== 'all') {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status && status !== 'all') {
      const isActive = status === 'true';
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Only allow specific fields to prevent SQL injection in ORDER BY
    const allowedSortFields = ['createdAt', 'name', 'email', 'role'];
    const actualSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const actualSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`user.${actualSortBy}`, actualSortOrder);

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createAdminUser(dto: CreateAdminUserDto): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async updateRole(id: string, role: UserRole): Promise<User | null> {
    await this.usersRepository.update(id, { role });
    return this.findById(id);
  }

  async updateStatus(id: string, isActive: boolean): Promise<User | null> {
    await this.usersRepository.update(id, { isActive });
    return this.findById(id);
  }

  async updateUser(id: string, dto: UpdateAdminUserDto): Promise<User | null> {
    const updateData: Partial<User> = { ...dto };

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(dto.password, salt);
    }

    await this.usersRepository.update(id, updateData);
    return this.findById(id);
  }
}
