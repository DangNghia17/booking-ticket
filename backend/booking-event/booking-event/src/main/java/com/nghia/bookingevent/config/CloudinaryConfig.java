package com.nghia.bookingevent.config;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nghia.bookingevent.utils.ImageUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

import java.io.IOException;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public CommonsMultipartResolver commonsMultipartResolver(){
        CommonsMultipartResolver resolver = new CommonsMultipartResolver();
        resolver.setDefaultEncoding("UTF-8");
        return resolver;
    }

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "meaning17",
                "api_key", "791267993236675",
                "api_secret", "z5wPGC_gWFuM8jme3vYS7nUUQtw",
                "secure", true
        ));
    }

    public String getPublicId(String urlImage){
        int temp1 = urlImage.lastIndexOf(".");
        int temp2 = urlImage.lastIndexOf("/");
        return urlImage.substring(temp2+1,temp1);
    }

    public String uploadImage(MultipartFile file, String urlDestroy) throws IOException {
        Map params = ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", "lotus/user"
        );
        Map map = cloudinary().uploader().upload(ImageUtils.convertMultiPartToFile(file), params);
        ImageUtils.deleteMultipartFile(ImageUtils.convertMultiPartToFile(file));
        return map.get("secure_url").toString();
    }

    public void deleteImage(String urlImage) throws IOException {
        cloudinary().uploader().destroy("lotus/user/" + getPublicId(urlImage),
                ObjectUtils.asMap("resource_type", "image"));
    }
}
