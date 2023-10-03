import { CONFIG } from "../../config";
import open from "open";

export const getAccessCode = async () => {
  return open(`${CONFIG.SC.BASE_URL}/connect?client_id=${CONFIG.SC.CLIENT_ID}&redirect_uri=${CONFIG.SC.REDIRECT_URI}&response_type=code`);
}
