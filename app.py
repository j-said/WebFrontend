import os
from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Database Configuration 
app.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
app.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
app.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
app.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
app.config["MYSQL_CURSORCLASS"] = "DictCursor"  # Returns results as dictionaries

# Initialize MySQL
mysql = MySQL(app)

# ===================================================================
#  HTML PAGE ROUTES (for users)
# ===================================================================


@app.route("/")
def index():
    """Serves the main index.html page."""
    return render_template("index.html")


@app.route("/create")
def create():
    """Serves the create.html page."""
    return render_template("create.html")


@app.route("/edit")
def edit():
    """Serves the edit.html page."""
    return render_template("edit.html")


# ===================================================================
#  API ROUTES (for JavaScript)
# ===================================================================


@app.route("/api/products", methods=["GET"])
def get_products():
    """API route to fetch all products."""
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM products ORDER BY created_at DESC")
        products = cur.fetchall()
        cur.close()

        # Convert datetime objects to JSON-friendly strings
        for product in products:
            if "created_at" in product:
                product["created_at"] = product["created_at"].isoformat()

        return jsonify(products)

    except Exception as e:
        print(f"Error fetching products: {e}")
        return jsonify({"error": "Failed to fetch products"}), 500


@app.route("/api/products", methods=["POST"])
def create_product():
    """API route to create a new product."""
    try:
        data = request.get_json()
        required_fields = ["title", "description", "price", "product_type"]

        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        title = data.get("title")
        description = data.get("description")
        price = data.get("price")
        product_type = data.get("product_type")

        cur = mysql.connection.cursor()
        query = "INSERT INTO products (title, description, price, product_type) VALUES (%s, %s, %s, %s)"
        cur.execute(query, (title, description, price, product_type))
        mysql.connection.commit()

        new_product_id = cur.lastrowid
        cur.close()

        return (
            jsonify({"message": "Product created successfully", "id": new_product_id}),
            201,
        )

    except Exception as e:
        mysql.connection.rollback()
        print(f"Error creating product: {e}")
        return jsonify({"error": "Failed to create product"}), 500


@app.route("/api/products/<int:id>", methods=["GET"])
def get_product(id):
    """API route to fetch a single product by its ID."""
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM products WHERE id = %s", (id,))
        product = cur.fetchone()  # Use fetchone() to get a single item
        cur.close()

        if product:
            # Convert datetime for JSON
            if "created_at" in product:
                product["created_at"] = product["created_at"].isoformat()
            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404

    except Exception as e:
        print(f"Error fetching product: {e}")
        return jsonify({"error": "Failed to fetch product"}), 500


@app.route("/api/products/<int:id>", methods=["PUT"])
def update_product(id):
    """API route to dynamically update an existing product."""
    try:
        data = request.get_json()
        data.pop("id", None)  # Remove 'id' if user sent it

        if not data:
            return jsonify({"error": "No update fields provided"}), 400

        set_parts = []
        values = []
        for key, value in data.items():
            set_parts.append(f"{key} = %s")
            values.append(value)

        if not set_parts:
            return jsonify({"error": "No valid fields to update"}), 400

        set_string = ", ".join(set_parts)
        values.append(id)
        values_tuple = tuple(values)

        query = f"UPDATE products SET {set_string} WHERE id = %s"

        cur = mysql.connection.cursor()
        cur.execute(query, values_tuple)
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Product updated successfully", "id": id}), 200

    except Exception as e:
        mysql.connection.rollback()
        print(f"Error updating product: {e}")
        return jsonify({"error": "Failed to update product"}), 500


@app.route("/api/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    """API route to delete a product by its ID."""
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM products WHERE id = %s", (id,))
        mysql.connection.commit()
        cur.close()

        return jsonify({"message": "Product deleted successfully"}), 200

    except Exception as e:
        mysql.connection.rollback()
        print(f"Error deleting product: {e}")
        return jsonify({"error": "Failed to delete product"}), 500


# ===================================================================
#  Start the application
# ===================================================================

if __name__ == "__main__":
    app.run(debug=True)
