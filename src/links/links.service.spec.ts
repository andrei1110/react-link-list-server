import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { LinksService } from "./links.service";
import { PagesService } from "../pages/pages.service";
import { Link } from "./entities/link.entity";
import { CreateLinkDto } from "./dtos/create-link.dto";

const mockLink: Link = {
  id: "1",
  title: "Test Link",
  url: "https://example.com",
  description: "Test description",
  icon: "icon.png",
  target: "_blank",
  order: 0,
  isActive: true,
  clickCount: 0,
  backgroundColor: "#ffffff",
  textColor: "#000000",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "user1",
  user: {} as any,
  pageId: "page1",
  page: {} as any,
};

describe("LinksService", () => {
  let service: LinksService;
  let repository: Repository<Link>;
  let pagesService: PagesService;

  const mockPagesService = {
    checkPageOwnership: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({
        totalClicks: "100",
        totalLinks: "5",
        averageClicks: "20",
      }),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockRepository,
        },
        {
          provide: PagesService,
          useValue: mockPagesService,
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    repository = module.get<Repository<Link>>(getRepositoryToken(Link));
    pagesService = module.get<PagesService>(PagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    const createLinkDto: CreateLinkDto = {
      title: "Test Link",
      url: "https://example.com",
      pageId: "page1",
    };

    it("should create a new link", async () => {
      mockPagesService.checkPageOwnership.mockResolvedValue(true);
      mockRepository.create.mockReturnValue(mockLink);
      mockRepository.save.mockResolvedValue(mockLink);

      const result = await service.create(createLinkDto, "user1");

      expect(result).toEqual(mockLink);
      expect(mockPagesService.checkPageOwnership).toHaveBeenCalledWith(
        "page1",
        "user1"
      );
    });

    it("should throw ForbiddenException if user does not own page", async () => {
      mockPagesService.checkPageOwnership.mockResolvedValue(false);

      await expect(service.create(createLinkDto, "user1")).rejects.toThrow(
        ForbiddenException
      );
    });

    it("should throw BadRequestException for invalid URL", async () => {
      mockPagesService.checkPageOwnership.mockResolvedValue(true);

      const invalidLinkDto = { ...createLinkDto, url: "invalid-url" };

      await expect(service.create(invalidLinkDto, "user1")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("findAllByPage", () => {
    it("should return all links for page", async () => {
      mockPagesService.checkPageOwnership.mockResolvedValue(true);
      mockRepository.find.mockResolvedValue([mockLink]);

      const result = await service.findAllByPage("page1", "user1");

      expect(result).toEqual([mockLink]);
    });

    it("should throw ForbiddenException if user does not own page", async () => {
      mockPagesService.checkPageOwnership.mockResolvedValue(false);

      await expect(service.findAllByPage("page1", "user1")).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe("findOne", () => {
    it("should return link by id", async () => {
      mockRepository.findOne.mockResolvedValue(mockLink);

      const result = await service.findOne("1", "user1");

      expect(result).toEqual(mockLink);
    });

    it("should throw NotFoundException if link not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("1", "user1")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    const updateLinkDto = {
      title: "Updated Title",
    };

    it("should update link", async () => {
      mockRepository.findOne.mockResolvedValue(mockLink);
      mockRepository.merge.mockReturnValue({ ...mockLink, ...updateLinkDto });
      mockRepository.save.mockResolvedValue({ ...mockLink, ...updateLinkDto });

      const result = await service.update("1", updateLinkDto, "user1");

      expect(result.title).toBe("Updated Title");
    });
  });

  describe("incrementClickCount", () => {
    it("should increment click count", async () => {
      await service.incrementClickCount("1");

      expect(mockRepository.increment).toHaveBeenCalledWith(
        { id: "1" },
        "clickCount",
        1
      );
    });
  });

  describe("getLinkStats", () => {
    it("should return link statistics", async () => {
      const result = await service.getLinkStats("user1");

      expect(result).toEqual({
        totalClicks: 100,
        totalLinks: 5,
        averageClicks: 20,
      });
    });
  });
});
