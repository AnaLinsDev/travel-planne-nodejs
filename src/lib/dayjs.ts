import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";


dayjs.locale("pt-br");
dayjs.extend(LocalizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);


export { dayjs}