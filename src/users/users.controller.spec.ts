import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { User } from "./entities/user.entity";

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: User = {
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
    getTotalPages: function (): number {
      return this.pages?.length || 0;
    },
    getActivePages: function (): User[] {
      return this.pages?.filter((page) => page.isActive) || [];
    },
  };

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const req = { user: { id: "1" } };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findById).toHaveBeenCalledWith("1");
    });
  });

  describe("updateProfile", () => {
    it("should update user profile", async () => {
      const req = { user: { id: "1" } };
      const updateUserDto: UpdateUserDto = { name: "Updated Name" };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(updateUserDto, req);

      expect(result).toEqual(updatedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith("1", updateUserDto);
    });
  });

  describe("deleteProfile", () => {
    it("should delete user profile", async () => {
      const req = { user: { id: "1" } };
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.deleteProfile(req);

      expect(mockUsersService.remove).toHaveBeenCalledWith("1");
    });
  });
});
