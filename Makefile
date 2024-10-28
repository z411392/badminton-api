.PHONY: format test compile dev bundle build push deploy load logs

format:
	@npx prettier lib --write
test:
	@npx jest --forceExit --detectOpenHandles --passWithNoTests
compile:
	@npx tsc && npx tsc-alias
dev:
	@trap 'npx pm2 delete boyholic-badminton-api' SIGINT; npx pm2 start --no-daemon
bundle:
	@npx ncc build lib/main.ts -m -o dist
build:
	@docker buildx build --progress=plain --platform linux/amd64 -t asia-east1-docker.pkg.dev/boyholic-badminton/gae/api .
push:
	@docker push asia-east1-docker.pkg.dev/boyholic-badminton/gae/api
deploy:
	@gcloud --project=boyholic-badminton app deploy --image-url=asia-east1-docker.pkg.dev/boyholic-badminton/gae/api
load:
	@node ./src/main.js load --userId=wT9yf3fvduNaALoB5PKPDMQVrNZ2 --from=895725d0-dd9c-5e2b-be12-243c0a6f6faf --to=6f709267-4a13-51d9-80a6-7ebbd31771b4
logs:
	@gcloud --project=boyholic-badminton app logs tail