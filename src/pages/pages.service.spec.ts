import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { PagesService } from "./pages.service";
import { Page } from "./entities/page.entity";
import { CreatePageDto } from "./dtos/create-page.dto";
import { UpdatePageDto } from "./dtos/update-page.dto";

// Mock page sem os métodos para evitar conflitos de tipagem
const createMockPage = (overrides?: Partial<Page>): Page => {
  const page: Page = {
    id: "1",
    title: "Test Page",
    subtitle: "Test Subtitle",
    permalink: "test-page",
    bio: "Test bio",
    profileImage: "image.jpg",
    isActive: true,
    backgroundColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "#007bff",
    buttonTextColor: "#ffffff",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user1",
    user: {} as any,
    links: [],
    ...overrides,
  };

  // Adicionar métodos dinamicamente se necessário para testes específicos
  if (overrides?.links) {
    page.getTotalClicks = function (): number {
      return (
        this.links?.reduce(
          (total, link) => total + (link.clickCount || 0),
          0
        ) || 0
      );
    };
    page.getActiveLinksCount = function (): number {
      return this.links?.filter((link) => link.isActive).length || 0;
    };
  }

  return page;
};

describe("PagesService", () => {
  let service: PagesService;
  let repository: Repository<Page>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        totalPages: "1",
        totalLinks: "5",
        totalClicks: "100",
        averageClicksPerLink: "20",
      }),
      getMany: jest.fn().mockResolvedValue([createMockPage()]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        {
          provide: getRepositoryToken(Page),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    repository = module.get<Repository<Page>>(getRepositoryToken(Page));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createPageDto: CreatePageDto = {
      title: "Test Page",
      subtitle: "Test Subtitle",
      permalink: "test-page",
    };

    it("should create a new page", async () => {
      const mockPage = createMockPage();
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockPage);
      mockRepository.save.mockResolvedValue(mockPage);

      const result = await service.create(createPageDto, "user1");

      expect(result).toEqual(mockPage);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createPageDto,
        userId: "user1",
      });
    });

    it("should throw ConflictException if permalink exists", async () => {
      const mockPage = createMockPage();
      mockRepository.findOne.mockResolvedValue(mockPage);

      await expect(service.create(createPageDto, "user1")).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAllByUser", () => {
    it("should return all pages for user", async () => {
      const mockPage = createMockPage();
      mockRepository.find.mockResolvedValue([mockPage]);

      const result = await service.findAllByUser("user1");

      expect(result).toEqual([mockPage]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: "user1" },
        relations: ["links"],
        order: { createdAt: "DESC" },
      });
    });
  });

  describe("findOne", () => {
    it("should return page by id and user", async () => {
      const mockPage = createMockPage();
      mockRepository.findOne.mockResolvedValue(mockPage);

      const result = await service.findOne("1", "user1");

      expect(result).toEqual(mockPage);
    });

    it("should throw NotFoundException if page not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("1", "user1")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    const updatePageDto: UpdatePageDto = {
      title: "Updated Title",
    };

    it("should update page", async () => {
      const mockPage = createMockPage();
      const updatedPage = { ...mockPage, ...updatePageDto };

      mockRepository.findOne.mockResolvedValue(mockPage);
      mockRepository.merge.mockReturnValue(updatedPage);
      mockRepository.save.mockResolvedValue(updatedPage);

      const result = await service.update("1", updatePageDto, "user1");

      expect(result.title).toBe("Updated Title");
    });
  });

  describe("remove", () => {
    it("should remove page", async () => {
      const mockPage = createMockPage();
      mockRepository.findOne.mockResolvedValue(mockPage);
      mockRepository.remove.mockResolvedValue(mockPage);

      await service.remove("1", "user1");

      expect(mockRepository.remove).toHaveBeenCalledWith(mockPage);
    });
  });

  describe("checkPageOwnership", () => {
    it("should return true if user owns page", async () => {
      const mockPage = createMockPage();
      mockRepository.findOne.mockResolvedValue(mockPage);

      const result = await service.checkPageOwnership("1", "user1");

      expect(result).toBe(true);
    });

    it("should return false if user does not own page", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.checkPageOwnership("1", "user1");

      expect(result).toBe(false);
    });
  });

  describe("getPageStats", () => {
    it("should return page statistics", async () => {
      const result = await service.getPageStats("user1");

      expect(result).toEqual({
        totalPages: 1,
        totalLinks: 5,
        totalClicks: 100,
        averageClicksPerLink: 20,
        mostPopularPage: null,
      });
    });
  });
});
