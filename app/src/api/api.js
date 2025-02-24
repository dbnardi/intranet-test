import { FixturesAPI } from "./fixtures";
import { SharePointAPI } from "./sharepoint";

const sharepoint =
  process.env.NODE_ENV == "development"
    ? new FixturesAPI()
    : new SharePointAPI();
export default sharepoint;
