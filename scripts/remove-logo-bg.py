"""Remove dark background from InkFit logo using flood-fill from edges."""
from collections import deque
from PIL import Image

path = r"D:\Project\AI Content Studio\public\inkfit-logo.png"
img = Image.open(path).convert("RGBA")
pixels = img.load()
w, h = img.size

# Detect background: dark pixels similar to edge samples
edge_colors = []
for x in range(w):
    edge_colors.append(pixels[x, 0][:3])
    edge_colors.append(pixels[x, h - 1][:3])
for y in range(h):
    edge_colors.append(pixels[0, y][:3])
    edge_colors.append(pixels[w - 1, y][:3])

bg_r = sorted(c[0] for c in edge_colors)[len(edge_colors) // 2]
bg_g = sorted(c[1] for c in edge_colors)[len(edge_colors) // 2]
bg_b = sorted(c[2] for c in edge_colors)[len(edge_colors) // 2]

def is_background(r, g, b):
    dr, dg, db = r - bg_r, g - bg_g, b - bg_b
    dist = (dr * dr + dg * dg + db * db) ** 0.5
    brightness = max(r, g, b)
    # Dark and close to sampled background
    return brightness < 55 and dist < 38

# Flood fill from all border pixels
visited = [[False] * w for _ in range(h)]
queue = deque()

for x in range(w):
    for y in (0, h - 1):
        if is_background(*pixels[x, y][:3]):
            queue.append((x, y))
            visited[y][x] = True
for y in range(h):
    for x in (0, w - 1):
        if not visited[y][x] and is_background(*pixels[x, y][:3]):
            queue.append((x, y))
            visited[y][x] = True

bg_mask = [[False] * w for _ in range(h)]
while queue:
    x, y = queue.popleft()
    bg_mask[y][x] = True
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
            r, g, b, _ = pixels[nx, ny]
            if is_background(r, g, b):
                visited[ny][nx] = True
                queue.append((nx, ny))

# Apply transparency with soft edge feather
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if bg_mask[y][x]:
            pixels[x, y] = (r, g, b, 0)
        else:
            # Feather pixels near background boundary
            dr, dg, db = r - bg_r, g - bg_g, b - bg_b
            dist = (dr * dr + dg * dg + db * db) ** 0.5
            brightness = max(r, g, b)
            if brightness < 70 and dist < 55:
                feather = int(min(255, max(0, (dist - 8) / 47 * 255)))
                pixels[x, y] = (r, g, b, min(a, feather))

img.save(path, "PNG")
print(f"Transparent logo saved {w}x{h}, bg=({bg_r},{bg_g},{bg_b})")
