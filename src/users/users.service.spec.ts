import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

// Mock user sem os métodos para evitar conflitos de tipagem
const createMockUser = (overrides?: Partial<User>): User => {
  const user: User = {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    birthDate: new Date("1990-01-01"),
    googleId: "google123",
    country: "Brazil",
    state: "SP",
    city: "São Paulo",
    avatar: "avatar.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
    pages: [],
    ...overrides,
  };

  // Adicionar métodos dinamicamente se necessário para testes específicos
  if (overrides?.pages) {
    user.getTotalPages = function (): number {
      return this.pages?.length || 0;
    };
    user.getActivePages = function (): Page[] {
      return this.pages?.filter((page) => page.isActive) || [];
    };
  }

  return user;
};

describe("UsersService", () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createUserDto: CreateUserDto = {
      email: "test@example.com",
      name: "Test User",
      birthDate: "1990-01-01",
      googleId: "google123",
      country: "Brazil",
      state: "SP",
      city: "São Paulo",
      avatar: "avatar.jpg",
    };

    it("should create a new user", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it("should throw ConflictException if email already exists", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });

    it("should throw ConflictException if googleId already exists", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne
        .mockResolvedValueOnce(null) // First call for email check
        .mockResolvedValueOnce(mockUser); // Second call for googleId check

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findByEmail", () => {
    it("should return user by email", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@example.com");

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
        relations: ["pages", "pages.links"],
      });
    });

    it("should return null if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findByGoogleId", () => {
    it("should return user by googleId", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByGoogleId("google123");

      expect(result).toEqual(mockUser);
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById("1");

      expect(result).toEqual(mockUser);
    });
  });

  describe("update", () => {
    const updateUserDto: UpdateUserDto = {
      name: "Updated Name",
      email: "updated@example.com",
    };

    it("should update user", async () => {
      const mockUser = createMockUser();
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.merge.mockReturnValue(updatedUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update("1", updateUserDto);

      expect(result.name).toBe("Updated Name");
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockUser,
        updateUserDto
      );
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update("1", updateUserDto)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw ConflictException if email already in use", async () => {
      const mockUser = createMockUser();
      const existingUser = createMockUser({ id: "2" });

      mockRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for user find
        .mockResolvedValueOnce(existingUser); // Second call for email check

      await expect(service.update("1", updateUserDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("remove", () => {
    it("should remove user", async () => {
      const mockUser = createMockUser();
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);

      await service.remove("1");

      expect(mockRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove("1")).rejects.toThrow(NotFoundException);
    });
  });
});
