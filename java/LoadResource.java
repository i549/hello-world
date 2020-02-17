import java.net.URL;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

public class LoadResource {
    public static void test(){
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        String suffix = ExportConstants.RES_FONT + File.separator + name;
        Resource[] resource = resolver.getResources("classpath*:" + suffix);
        if (null != resource && resource.length > 0) {
            System.out.println(resource[0].getURL());
        }
    }
}
