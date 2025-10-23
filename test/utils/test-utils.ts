import { User } from "../../src/users/entities/user.entity";
import { Page } from "../../src/pages/entities/page.entity";
import { Link } from "../../src/links/entities/link.entity";

export const createMockUser = (overrides?: Partial<User>): User => ({
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
  ...overrides,
});

export const createMockPage = (overrides?: Partial<Page>): Page => ({
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
  user: createMockUser(),
  links: [],
  getTotalClicks: function (): number {
    return (
      this.links?.reduce((total, link) => total + (link.clickCount || 0), 0) ||
      0
    );
  },
  getActiveLinksCount: function (): number {
    return this.links?.filter((link) => link.isActive).length || 0;
  },
  ...overrides,
});

export const createMockLink = (overrides?: Partial<Link>): Link => ({
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
  user: createMockUser(),
  pageId: "page1",
  page: createMockPage(),
  ...overrides,
});
