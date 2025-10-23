import { User } from "../users/entities/user.entity";
import { Page } from "../pages/entities/page.entity";

declare module "../users/entities/user.entity" {
  interface User {
    getTotalPages(): number;
    getActivePages(): Page[];
  }
}

declare module "../pages/entities/page.entity" {
  interface Page {
    getTotalClicks(): number;
    getActiveLinksCount(): number;
  }
}
