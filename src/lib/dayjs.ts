import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import LocalizedFormat from "dayjs/plugin/localizedFormat";

dayjs.locale("pt-br");
dayjs.extend(LocalizedFormat);

export { dayjs}