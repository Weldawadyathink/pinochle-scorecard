import { sql } from "drizzle-orm";
import { text, sqliteTable, index } from "drizzle-orm/sqlite-core";

export const game = sqliteTable(
	"game",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull().unique(),
		last_access: text("last_access").notNull(),
	},
	(table) => {
		return {
			nameIdx: index("name_idx").on(table.name),
		};
	},
);
