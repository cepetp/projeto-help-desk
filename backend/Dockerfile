# Etapa 1: Build da aplicação (usa Maven e JDK 17)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia os arquivos do projeto e gera o .jar pulando os testes para agilizar o deploy
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Execução leve (usa apenas o JRE 17, muito menor que o JDK)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia apenas o arquivo .jar compilado da etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão (o Render injeta a variável PORT automaticamente)
EXPOSE 8080

# Executa com limite rígido de RAM (-Xmx320m) para não estourar os 512MB do Render
ENTRYPOINT ["java", "-Xmx320m", "-Xms128m", "-XX:+UseSerialGC", "-Dserver.port=${PORT:8080}", "-jar", "app.jar"]
