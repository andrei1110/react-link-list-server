import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

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

  const mockGoogleUser = {
    googleId: "google123",
    email: "test@example.com",
    name: "Test User",
    avatar: "avatar.jpg",
    accessToken: "access_token",
  };

  const mockUsersService = {
    findByGoogleId: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateGoogleUser", () => {
    it("should return existing user", async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findByGoogleId).toHaveBeenCalledWith("google123");
    });

    it("should create new user if not exists", async () => {
      mockUsersService.findByGoogleId.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.validateGoogleUser(mockGoogleUser);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        googleId: "google123",
        birthDate: expect.any(String),
        avatar: "avatar.jpg",
      });
    });
  });

  describe("login", () => {
    it("should return access token and user data", async () => {
      const mockToken = "jwt_token";
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          avatar: mockUser.avatar,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: mockUser.email,
        sub: mockUser.id,
        name: mockUser.name,
      });
    });
  });
});
