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
format:
	bunx prisma format
seed:
	bunx prisma db seed

.PHONY: newmg migratedown migratepull migrateup migratedev format seed