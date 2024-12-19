import { defineTemplate } from "@easypanel-io/templates";

export default defineTemplate({
  name: "Fleet",
  meta: {
    description: "Fleet is an open-source platform for device management and monitoring.",
    categories: ["Monitoring", "Device Management"],
    platform: "linux/amd64",
  },
  variables: [
    {
      key: "MYSQL_ROOT_PASSWORD",
      label: "MySQL Root Password",
      description: "The root password for the MySQL database.",
      default: "toor",
    },
    {
      key: "MYSQL_DATABASE",
      label: "MySQL Database Name",
      description: "The name of the database to be used for Fleet.",
      default: "fleet",
    },
    {
      key: "MYSQL_USER",
      label: "MySQL User",
      description: "The username for the MySQL database.",
      default: "fleet",
    },
    {
      key: "MYSQL_PASSWORD",
      label: "MySQL Password",
      description: "The password for the MySQL user.",
      default: "insecure",
    },
    {
      key: "MINIO_ROOT_USER",
      label: "MinIO Root User",
      description: "The root username for MinIO.",
      default: "minio",
    },
    {
      key: "MINIO_ROOT_PASSWORD",
      label: "MinIO Root Password",
      description: "The root password for MinIO.",
      default: "minio123!",
    },
    {
      key: "FLEET_MYSQL_IMAGE",
      label: "MySQL Image",
      description: "The Docker image to use for MySQL.",
      default: "mysql:8.0.36",
    },
    {
      key: "FLEET_MYSQL_PLATFORM",
      label: "MySQL Platform",
      description: "The platform to use for the MySQL container.",
      default: "linux/x86_64",
    },
  ],
  services: [
    {
      name: "mysql",
      image: "${FLEET_MYSQL_IMAGE}",
      platform: "${FLEET_MYSQL_PLATFORM}",
      ports: ["3306:3306"],
      volumes: ["mysql-persistent-volume:/tmp"],
      command: [
        "mysqld",
        "--datadir=/tmp/mysqldata",
        "--enforce-gtid-consistency=ON",
        "--log-bin=bin.log",
        "--server-id=master-01",
        "--max_allowed_packet=536870912",
      ],
      environment: {
        MYSQL_ROOT_PASSWORD: "${MYSQL_ROOT_PASSWORD}",
        MYSQL_DATABASE: "${MYSQL_DATABASE}",
        MYSQL_USER: "${MYSQL_USER}",
        MYSQL_PASSWORD: "${MYSQL_PASSWORD}",
        CLUSTER_NAME: "fleet",
      },
    },
    {
      name: "redis",
      image: "redis:5",
      ports: ["6379:6379"],
    },
    {
      name: "mailhog",
      image: "mailhog/mailhog:latest",
      ports: ["8025:8025", "1025:1025"],
    },
    {
      name: "saml_idp",
      image: "fleetdm/docker-idp:latest",
      volumes: [
        "./tools/saml/users.php:/var/www/simplesamlphp/config/authsources.php",
        "./tools/saml/config.php:/var/www/simplesamlphp/metadata/saml20-sp-remote.php",
      ],
      ports: ["9080:8080", "9443:8443"],
    },
    {
      name: "prometheus",
      image: "prom/prometheus:latest",
      ports: ["9090:9090"],
      volumes: ["./tools/app/prometheus.yml:/etc/prometheus/prometheus.yml"],
    },
    {
      name: "minio",
      image: "quay.io/minio/minio",
      command: ["server", "/data", "--console-address", ":9001"],
      ports: ["9000:9000", "9001:9001"],
      environment: {
        MINIO_ROOT_USER: "${MINIO_ROOT_USER}",
        MINIO_ROOT_PASSWORD: "${MINIO_ROOT_PASSWORD}",
      },
      volumes: ["data-minio:/data"],
    },
  ],
  volumes: {
    "mysql-persistent-volume": {},
    "data-minio": {},
  },
});
