from PIL import Image

def process_favicon(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Get data
    datas = img.getdata()
    
    # Create new data with black color but original alpha
    new_data = []
    for item in datas:
        # item is (R, G, B, A)
        if item[3] > 0:
            # Set to black (0,0,0) and keep original alpha
            new_data.append((0, 0, 0, item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Make it square
    width, height = img.size
    max_dim = max(width, height)
    
    # Create a new square transparent image
    square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
    
    # Calculate position to paste the original image (centered)
    x = (max_dim - width) // 2
    y = (max_dim - height) // 2
    
    # Paste the black image into the square canvas
    square_img.paste(img, (x, y), img)
    
    # Save the output
    square_img.save(output_path, "PNG")
    print("Favicon processed and saved to", output_path)

if __name__ == "__main__":
    process_favicon("public/images/ISOTIPO R&R-Photoroom.png", "public/images/favicon-square.png")
