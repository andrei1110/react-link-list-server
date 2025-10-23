import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateGoogleUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("googleAuth", () => {
    it("should be defined", () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe("googleAuthRedirect", () => {
    it("should redirect with token", async () => {
      const mockReq = { user: { googleId: "123" } };
      const mockRes = { redirect: jest.fn() };
      const mockUser = { id: "1", email: "test@example.com" };
      const loginResult = { access_token: "token", user: mockUser };

      mockAuthService.validateGoogleUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(loginResult);

      await controller.googleAuthRedirect(mockReq, mockRes as any);

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith(
        mockReq.user
      );
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
      expect(mockRes.redirect).toHaveBeenCalledWith(
        "http://localhost:3001/auth/success?token=token"
      );
    });
  });
});
