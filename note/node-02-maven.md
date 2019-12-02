pom.xml

```xml
<!--  跳过测试  -->
<profiles>
    <profile>
        <id>fast</id>
        <properties>
            <maven.test.skip>true</maven.test.skip>
        </properties>
    </profile>
</profiles>
```
