newmg:
	bunx prisma migrate dev --name $(name)
migratedown:
	bunx prisma migrate reset
migrateup:
	bunx prisma db push
migratedev:
	bunx prisma migrate dev
migratepull:
	bunx prisma db pull

.PHONY: newmg migratedown migratepull migrateup migratedev