import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { GoogleStrategy } from "./google.strategy";

describe("GoogleStrategy", () => {
  let strategy: GoogleStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user profile", async () => {
      const profile = {
        id: "123",
        emails: [{ value: "test@example.com" }],
        name: { givenName: "Test", familyName: "User" },
        photos: [{ value: "avatar.jpg" }],
      };

      const done = jest.fn();

      await strategy.validate("access_token", "refresh_token", profile, done);

      expect(done).toHaveBeenCalledWith(null, {
        googleId: "123",
        email: "test@example.com",
        name: "Test User",
        avatar: "avatar.jpg",
        accessToken: "access_token",
      });
    });
  });
});
