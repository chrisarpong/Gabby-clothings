from PIL import Image

def remove_black_background(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # item is (R, G, B, A)
        if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
            new_data.append((255, 255, 255, 0)) # transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

remove_black_background("src/assets/logo.jpg", "src/assets/logo_transparent.png")
