namespace mapfileManager.mapfile
{
    public class Consts
    {
        public static string UNITS_SET = "dd|feet|inches|kilometers|meters|miles|nauticalmiles";
        public static string CONFIG_SET = "CGI_CONTEXT_URL|MS_ENCRYPTION_KEY|MS_ERRORFILE|MS_NONSQUARE|PROJ_LIB";
        public static string CONNECTIONTYPE_SET = "contour|kerneldensity|local|ogr|oraclespatial|plugin|postgis|sde|union|uvraster|wfs|wms";
        public static string TYPE_SET = "chart|circle|line|point|polygon|raster|query";
        public static string FUNC_SET = "buffer|simplify|simplifypt|generalize|smoothsia";
        public static string TRANSFORM_SET = "ul|uc|ur|cl|cc|cr|ll|lc|lr"; //if value is selected, then precede it with true...
        public static string STATUS_SET = "on|off|default";
        public static string IMAGETYPE_SET = "png|png8|jpeg|jpeg_png|jpeg_png8|GTiff|kml|kmz|cairopng|pdf|svg";
        public static string COMPOSITE_SET= "clear|color-burn|color-dodge|contrast*|darken|difference|dst|dst-atop|dst-in|dst-out|dst-over|exclusion|hard-light|invert*|invert-rgb*|lighten|minus*|multiply|overlay|plus|screen|soft-light|src|src-atop|src-in|src-out|src-over|xor";
        public static string LABELFORMAT_SET= "DD|DDMM|DDMMSS|C";
        public static string ALIGN_SET= "left|center|right";
        public static string ANGLE_SET= "double|auto|auto2|follow|attribute";
        public static string BOOL_SET= "true|false";
        public static string POSITION_SET = "ul|uc|ur|cl|cc|cr|ll|lc|lr|auto";
        public static string LABELTYPE_SET= "bitmap|truetype";
        public static string LEGENDSTATUS_SET= "on|off|embed";
        public static string GEOTRANSFORM_SET = "bbox|centroid|end|labelpnt|labelpoly|start|vertices";
        public static string LINECAP_SET= "butt|round|square";
        public static string REGION_SET = "ellipse|rectangle";
        public static string SYMBOLTYPE_SET= "ellipse|hatch|pixmap|svg|truetype|vector";
        public static string CONNECTION_STRING = "CLOSE_CONNECTION=DEFER|LABEL_NO_CLIP=True|APPROXIMATION_SCALE=full|DITHER=YES|EXTENT_PRIORITY=WORLD|LOAD_FULL_RES_IMAGE=YES";
        

    }
}
