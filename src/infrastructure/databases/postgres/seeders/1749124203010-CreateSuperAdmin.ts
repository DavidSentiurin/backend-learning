import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { LanguagesEnum, RolesEnum } from '@project-common/enums';
import { UserEntity } from '@project-modules/user';
import { HashUtil } from '@project-utils/hash';

export default class CreateSuperAdmin1749124203010 implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const initialEmail = 'admin@superadmin.com';

    const userRepository = dataSource.getRepository(UserEntity);
    const hashService = new HashUtil();

    const existingAdmin = await userRepository.findOne({
      where: { email: initialEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping creation');
      return;
    }

    try {
      const adminUser = userRepository.create({
        email: initialEmail,
        firstName: 'Admin',
        lastName: 'User',
        password: await hashService.hash(
          process.env.ADMIN_DEFAULT_PASSWORD || '3WfJaHeE9Cb4UUjTy%dZ',
        ),
        language: LanguagesEnum.English,
        isTermsConfirmed: true,
        roles: [RolesEnum.ADMIN],
      });

      await userRepository.save(adminUser);
      console.log('Admin user created successfully');
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
}
